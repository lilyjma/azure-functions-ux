import React from 'react';
import { useTranslation } from 'react-i18next';
import { isEqual } from 'lodash-es';
import { style } from 'typestyle';
import { AppSettingsFormValues, AppSettingsFormProps } from '../AppSettings.types';
import { findFormAppSettingValue } from '../AppSettingsFormData';
import DailyUsageQuota from '../FunctionRuntimeSettings/DailyUsageQuota';
import RuntimeVersion from '../FunctionRuntimeSettings/RuntimeVersion';
import { CommonConstants } from '../../../../utils/CommonConstants';
import { ScenarioIds } from '../../../../utils/scenario-checker/scenario-ids';
import { ScenarioService } from '../../../../utils/scenario-checker/scenario.service';

const tabContainerStyle = style({
  marginTop: '15px',
});

const FunctionRuntimeSettingsPivot: React.FC<AppSettingsFormProps> = props => {
  const { t } = useTranslation();
  const scenarioChecker = new ScenarioService(t);
  const site = props.initialValues.site;

  if (!site) {
    return null;
  }

  return (
    <>
      <div id="function-runtime-settings" className={tabContainerStyle}>
        {site.properties.state && site.properties.state.toLocaleLowerCase() === CommonConstants.SiteStates.running.toLocaleLowerCase() && (
          <RuntimeVersion {...props} />
        )}

        {scenarioChecker.checkScenario(ScenarioIds.dailyUsageQuotaSupported, { site }).status === 'enabled' && (
          <DailyUsageQuota {...props} />
        )}
      </div>
    </>
  );
};

const runtimeVersionDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  const currentValue = findFormAppSettingValue(values.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion) || '';
  const initialValue = findFormAppSettingValue(initialValues.appSettings, CommonConstants.AppSettingNames.functionsExtensionVersion) || '';
  return !isEqual(currentValue, initialValue);
};

const dailyMemoryTimeQuotaDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return !isEqual(values.site.properties.dailyMemoryTimeQuota, initialValues.site.properties.dailyMemoryTimeQuota);
};

export const functionRuntimeSettingsDirty = (values: AppSettingsFormValues, initialValues: AppSettingsFormValues) => {
  return runtimeVersionDirty(values, initialValues) || dailyMemoryTimeQuotaDirty(values, initialValues);
};

export default FunctionRuntimeSettingsPivot;
