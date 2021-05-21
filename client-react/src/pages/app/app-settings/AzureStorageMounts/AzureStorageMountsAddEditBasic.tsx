import React, { useEffect, useState, useContext } from 'react';
import { FormAzureStorageMounts } from '../AppSettings.types';
import { AzureStorageMountsAddEditPropsCombined } from './AzureStorageMountsAddEdit';
import MakeArmCall, { getErrorMessageOrStringify } from '../../../../ApiHelpers/ArmHelper';
import { formElementStyle } from '../AppSettings.styles';
import { FormikProps, Field } from 'formik';
import ComboBox from '../../../../components/form-controls/ComboBox';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { useTranslation } from 'react-i18next';
import { StorageAccountsContext, SiteContext } from '../Contexts';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { MessageBarType } from 'office-ui-fabric-react';
import { StorageType } from '../../../../models/site/config';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { Links } from '../../../../utils/FwLinks';
import FunctionsService from '../../../../ApiHelpers/FunctionsService';
import LogService from '../../../../utils/LogService';
import { LogCategories } from '../../../../utils/LogCategories';

const storageKinds = {
  StorageV2: 'StorageV2',
  BlobStorage: 'BlobStorage',
  Storage: 'Storage',
};

const AzureStorageMountsAddEditBasic: React.FC<FormikProps<FormAzureStorageMounts> & AzureStorageMountsAddEditPropsCombined> = props => {
  const { errors, values, setValues, setFieldValue } = props;
  const [accountSharesFiles, setAccountSharesFiles] = useState([]);
  const [accountSharesBlob, setAccountSharesBlob] = useState([]);
  const [sharesLoading, setSharesLoading] = useState(false);
  const [accountError, setAccountError] = useState('');
  const storageAccounts = useContext(StorageAccountsContext);
  const site = useContext(SiteContext);
  const { t } = useTranslation();
  const scenarioService = new ScenarioService(t);

  const supportsBlobStorage = scenarioService.checkScenario(ScenarioIds.azureBlobMount, { site }).status !== 'disabled';
  const accountOptions = storageAccounts.value
    .filter(val => supportsBlobStorage || val.kind !== storageKinds.BlobStorage)
    .map(val => ({ key: val.name, text: val.name }));

  const validateStorageContainer = (value: string): string | undefined => {
    if (
      sharesLoading ||
      (value && values.type === 'AzureBlob'
        ? blobContainerOptions.find(x => x.key === value)
        : filesContainerOptions.find(x => x.key === value))
    ) {
      return undefined;
    }

    return t('validation_requiredError');
  };

  const storageAccount = storageAccounts.value.find(x => x.name === values.accountName);

  useEffect(() => {
    setAccountError('');
    if (storageAccount) {
      setAccountSharesBlob([]);
      setAccountSharesFiles([]);
      setSharesLoading(true);
      MakeArmCall({ resourceId: `${storageAccount.id}/listKeys`, commandName: 'listStorageKeys', method: 'POST' })
        .then(async ({ data }: any) => {
          const setAccessKey = (accessKey: string) => {
            setValues({ ...values, accessKey });
          };

          setAccessKey(data.keys[0].value);
          const payload = {
            accountName: values.accountName,
            accessKey: data.keys[0].value,
          };
          try {
            let blobsCall: any = {
              data: [],
            };

            if (supportsBlobStorage) {
              blobsCall = FunctionsService.getStorageContainers(values.accountName, payload);
            }

            let filesCall: any = {
              data: [],
            };

            if (storageAccount.kind !== storageKinds.BlobStorage) {
              filesCall = FunctionsService.getStorageFileShares(values.accountName, payload);
            }

            const [blobs, files] = await Promise.all([blobsCall, filesCall]);

            // add null check on blobs.metadata and files.metadata
            const blobsMetaData = blobs && blobs.metadata;
            const filesMetaData = files && files.metadata;

            const [blobsFailure, filesFailure] = [!(blobsMetaData && blobsMetaData.success), !(filesMetaData && filesMetaData.success)];

            let blobData = [];
            let filesData = [];

            if (blobsFailure && supportsBlobStorage) {
              LogService.error(
                LogCategories.appSettings,
                'getStorageContainers',
                `Failed to get storage containers: ${getErrorMessageOrStringify((blobsMetaData && blobsMetaData.error) || '')}`
              );
            } else {
              blobData = blobs.data || [];
            }

            if (filesFailure) {
              LogService.error(
                LogCategories.appSettings,
                'getStorageFileShares',
                `Failed to get storage file shares: ${getErrorMessageOrStringify((filesMetaData && filesMetaData.success) || '')}`
              );
            } else {
              filesData = files.data || [];
            }

            setSharesLoading(false);
            setAccountSharesFiles(filesData);
            setAccountSharesBlob(blobData);
            if (blobData.length === 0 || !supportsBlobStorage) {
              setFieldValue('type', 'AzureFiles');
            } else if (filesData.length === 0) {
              setFieldValue('type', 'AzureBlob');
            }
            if (filesData.length === 0 && blobData.length === 0) {
              let error = '';

              if (!supportsBlobStorage) {
                if (filesFailure) {
                  error = files.metadata.error
                    ? t('fileSharesFailureWithError').format(getErrorMessageOrStringify(files.metadata.error))
                    : t('fileSharesFailure');
                } else {
                  error = t('noFileShares');
                }
              } else if (storageAccount.kind === storageKinds.BlobStorage) {
                if (blobsFailure) {
                  error = blobs.metadata.error
                    ? t('blobsFailureWithError').format(getErrorMessageOrStringify(files.metadata.error))
                    : t('blobsFailure');
                } else {
                  error = t('noBlobs');
                }
              } else {
                error = t('noBlobsOrFilesShares');
              }

              setAccountError(error);
            }
          } catch (err) {
            console.log(err);
            setAccountError(t('noWriteAccessStorageAccount'));
          }
        })
        .catch(() => {
          setAccountError(t('noWriteAccessStorageAccount'));
        });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values.accountName]);

  const blobContainerOptions = accountSharesBlob.map((x: any) => ({ key: x.name, text: x.name }));
  const filesContainerOptions = accountSharesFiles.map((x: any) => ({ key: x.name, text: x.name }));

  const showStorageTypeOption = supportsBlobStorage && (!storageAccount || storageAccount.kind !== storageKinds.BlobStorage);

  return (
    <>
      <Field
        component={ComboBox}
        id="azure-storage-account-name"
        name="accountName"
        options={accountOptions}
        label={t('storageAccounts')}
        allowFreeform
        autoComplete="on"
        styles={{
          root: formElementStyle,
        }}
        errorMessage={errors.accountName}
        required={true}
        validate={() => {
          if (accountError) {
            return accountError;
          }
        }}
      />
      {showStorageTypeOption && (
        <Field
          component={RadioButton}
          name="type"
          id="azure-storage-mounts-name"
          label={t('storageType')}
          options={[
            {
              key: 'AzureBlob',
              text: t('azureBlob'),
              disabled: blobContainerOptions.length === 0,
            },
            {
              key: 'AzureFiles',
              text: t('azureFiles'),
              disabled: filesContainerOptions.length === 0,
            },
          ]}
        />
      )}
      {values.type === StorageType.azureBlob && supportsBlobStorage && (
        <CustomBanner
          id="azure-storage-mount-blob-warning"
          message={t('readonlyBlobStorageWarning')}
          learnMoreLink={Links.byosBlobReadonlyLearnMore}
          type={MessageBarType.warning}
          undocked={true}
        />
      )}
      <Field
        component={ComboBox}
        name="shareName"
        options={values.type === 'AzureBlob' ? blobContainerOptions : filesContainerOptions}
        label={t('storageContainer')}
        allowFreeform
        autoComplete="on"
        placeholder={sharesLoading ? t('loading') : t('selectAnOption')}
        styles={{
          root: formElementStyle,
        }}
        validate={(value: any) => {
          return validateStorageContainer(value);
        }}
        errorMessage={errors.shareName}
        required={true}
      />
    </>
  );
};

export default AzureStorageMountsAddEditBasic;
