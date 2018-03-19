module.exports = {
    "extends": "google",
    "parserOptions": {
        "ecmaVersion": 6
    },
    "rules": {
        "max-len": ["error", {
            "ignoreComments": true,
            "ignoreTrailingComments": true,
            "ignoreUrls": true,
            "ignoreStrings": true,
            "ignoreTemplateLiterals": true,
            "ignoreRegExpLiterals": true
        }],
        "new-cap": ["error", {
            "properties": false
        }]
    }
};