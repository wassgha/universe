const getMainSharedModules = require('./ChunkCorrelationPlugin').getMainSharedModules

describe("getMainSharedModules", () => {
  it("should return an empty array if stats.namedChunkGroups['main'] is not defined", () => {
    const stats = {namedChunkGroups: {}, chunks: []};
    const result = getMainSharedModules(stats);
    expect(result).toEqual([]);
  });

  it('should correctly filter chunks that do not have any files or modules that match the criteria', () => {
    const stats = {
      namedChunkGroups: {
        main: {
          chunks: [1, 2, 3],
        },
      },
      chunks: [
        {
          id: 1,
          children: [4, 5],
          files: ['file1.js'],
          modules: [
            {
              issuer: "consume-shared-module|default|shared-module-a|^4.2.5|true|/Users/zjackson/Documents/lulu_dev/federation-dashboard/dashboard-example/node_modules/antd/es/index.js|false|false",
            },
          ],
        },
        {
          id: 2,
          children: [],
          files: [],
          modules: [
            {
              issuer: "consume-shared-module|default|shared-module-b|^4.2.5|true|/Users/zjackson/Documents/lulu_dev/federation-dashboard/dashboard-example/node_modules/antd/es/index.js|false|false",
            },
          ],
        },
        {
          id: 3,
          children: [],
          files: ['file3.js'],
          modules: [
            {
              issuer: 'non-matching-issuer',
            },
          ],
        },
        {
          id: 4,
          files: ['file4.js'],
          modules: [
            {
              issuer: "consume-shared-module|default|shared-module-c|^4.2.5|true|/Users/zjackson/Documents/lulu_dev/federation-dashboard/dashboard-example/node_modules/antd/es/index.js|false|false",
            },
          ],
        },
        {
          id: 5,
          files: [],
          modules: [
            {
              issuer: "consume-shared-module|default|shared-module-d|^4.2.5|true|/Users/zjackson/Documents/lulu_dev/federation-dashboard/dashboard-example/node_modules/antd/es/index.js|false|false",
            },
          ],
        },
      ],
    };
    const result = getMainSharedModules(stats);
    expect(result).toEqual([
      {
        chunks: ['file4.js'],
        provides: [
          {
            "eager": false,
            "requiredVersion": "^4.2.5",
            "shareKey": "shared-module-c",
            "shareScope": "default",
            "singleton": false,
            "strictVersion": true,
          }
        ],
      },
    ]);
  });

  it("should handle modules without issuers", () => {
    const stats = {
      namedChunkGroups: {
        main: {
          chunks: [1],
        },
      },
      chunks: [
        {
          id: 1,
          children: [2],
          modules: [
            {
              issuer: "consume-shared-module",
            },
          ],
        },
        {
          id: 2,
          files: ["file1.js"],
          modules: [
            {},
          ],
        },
      ],
    };
    const result = getMainSharedModules(stats);
    expect(result).toEqual([]);
  });
});


