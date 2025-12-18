import pkg from "sonarqube-scanner";
const { default: sonarqubeScanner } = pkg;

sonarqubeScanner(
  {
    serverUrl: "http://sonarqube.imcc.com/",
    token: "sqp_51dc6dfb789de440cbc3320e8591365708d7018b",

    options: {
      "sonar.projectKey": "blockvote-2401098",
      "sonar.projectName": "2401098-Blockvote - Blockchain Voting System",

      // Scan frontend + backend folders
      "sonar.sources": "./",

      // Exclude unwanted folders
      "sonar.exclusions":
        "node_modules/**, frontend/node_modules/**, backend/node_modules/**, dist/**, build/**, coverage/**",

      // Include JS/TS/React/Node files
      "sonar.inclusions": "**/*.js, **/*.jsx, **/*.ts, **/*.tsx"
    },
  },
  () => process.exit()
);
