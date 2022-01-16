# Expo Releaser

A simple cli to update your expo configurations for a new release 

## Usage

Run the cli command - `expo-releaser`

<img width="479" alt="Screen Shot 2022-01-15 at 7 29 18 PM" src="https://user-images.githubusercontent.com/1700158/149643842-8d601f33-839d-4239-823a-252f93abee53.png">


The command will save changes to your expo configuration files like so:

**app.config.js**
```diff
{
-    version: "1.3.1",
+    version: "1.3.2",
     ios: {
-        buildNumber: "14",
+        buildNumber: "15",
     },
     android: {
-        versionCode: 12,
+        versionCode: 13,
     }
}
```

**eas.json**
```diff
{
  "build": {
     "staging": {
-      "releaseChannel": "staging-1.3.1",
+      "releaseChannel": "staging-1.3.2",
     },
     "prod": {
-      "releaseChannel": "prod-1.3.1",
+      "releaseChannel": "prod-1.3.2",
     }
  }
}
```

**package.json**
```diff
{
   "name": "my-app",
-  "version": "1.3.1",
+  "version": "1.3.2",
}
```

Review the changes. If they look good then commit and begin your deployment workflow.

### Future considerations

- meow – Simple command-line helper.
- chalk – Terminal string styling.
- yargs – Command-line opt-string parser.

## License
expo-releaser is Copyright © 2022 GorillaBot Labs, LLC. It is free software, and may be redistributed under 
the terms specified in the [LICENSE](/LICENSE.md) file.

## About GorillaBot Labs

[GorillaBot Labs](https://gorillabotlabs.com?utm_source=github)

expo-releaser is maintained and funded by GorillaBot Labs, LLC.

We help bold entrepreneurs solve big problems with software. [Hire us][hire] to design, develop, and grow your product.

[hire]: https://gorillabotlabs.com/contact?utm_source=github
