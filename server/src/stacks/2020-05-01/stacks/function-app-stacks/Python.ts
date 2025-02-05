import { FunctionAppStack } from '../../models/FunctionAppStackModel';

export const pythonStack: FunctionAppStack = {
  sortOrder: 2,
  displayText: 'Python',
  value: 'python',
  versions: [
    {
      sortOrder: 1,
      displayText: '3.10',
      value: '3.10',
      isDefault: false,
      supportedPlatforms: [
        {
          sortOrder: 0,
          os: 'linux',
          isPreview: true,
          isDeprecated: false,
          isHidden: true,
          applicationInsightsEnabled: true,
          runtimeVersion: 'Python|3.10',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'python',
          },
          siteConfigPropertiesDictionary: {
            use32BitWorkerProcess: false,
            linuxFxVersion: 'Python|3.10',
          },
        },
      ],
    },
    {
      sortOrder: 2,
      displayText: '3.9',
      value: '3.9',
      isDefault: false,
      supportedPlatforms: [
        {
          sortOrder: 0,
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: 'Python|3.9',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'python',
          },
          siteConfigPropertiesDictionary: {
            use32BitWorkerProcess: false,
            linuxFxVersion: 'Python|3.9',
          },
        },
      ],
    },
    {
      sortOrder: 3,
      displayText: '3.8',
      value: '3.8',
      isDefault: false,
      supportedPlatforms: [
        {
          sortOrder: 0,
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: 'Python|3.8',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'python',
          },
          siteConfigPropertiesDictionary: {
            use32BitWorkerProcess: false,
            linuxFxVersion: 'Python|3.8',
          },
        },
      ],
    },
    {
      sortOrder: 4,
      displayText: '3.7',
      value: '3.7',
      isDefault: true,
      supportedPlatforms: [
        {
          sortOrder: 0,
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: 'Python|3.7',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'python',
          },
          siteConfigPropertiesDictionary: {
            use32BitWorkerProcess: false,
            linuxFxVersion: 'Python|3.7',
          },
        },
      ],
    },
    {
      sortOrder: 5,
      displayText: '3.6',
      value: '3.6',
      isDefault: false,
      supportedPlatforms: [
        {
          sortOrder: 0,
          os: 'linux',
          isPreview: false,
          isDeprecated: false,
          isHidden: false,
          applicationInsightsEnabled: true,
          runtimeVersion: 'Python|3.6',
          appSettingsDictionary: {
            FUNCTIONS_WORKER_RUNTIME: 'python',
          },
          siteConfigPropertiesDictionary: {
            use32BitWorkerProcess: false,
            linuxFxVersion: 'Python|3.6',
          },
        },
      ],
    },
  ],
};
