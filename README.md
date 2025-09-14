# **PurgeSASS**

A lightweight tool to automatically **purge unused CSS rules directly inside your Sass (.scss) files**.

This project combines:

* [postcss](https://github.com/postcss/postcss) – CSS manipilation tool with js
* [purgeCSS](https://github.com/FullHuman/purgecss) – CSS rule cleaner  
* [glob](https://github.com/isaacs/node-glob) – File pattern matching

With these, it scans your project, detects which selectors are actually used, and removes the rest — at the **Sass source level**, not just the compiled CSS.

The npm package for this tool is purgesass.

## **📦 Installation**

Install the package directly from npm:

```
npm install purgesass
```

## **⚡ Usage**

Run the purger with:

```ts
import { purgeSASS } from "purgesass";

const projectRoot = "path/to/your/project";  

purgeSASS({ content: [
  `${projectRoot}/src/html/**/*.{html,js,jsx,tsx,cshtml}`,
],
 scss: [
  `${projectRoot}/src/styles/**/*.scss`,
]});
```

## **🛠 How It Works**

1. Selector extraction  
   Files matched in content are scanned for CSS selectors in use.
2. Dependency analysis
    
    All `scss` files are scanned and all imports are mapped out. 
2. The purge

   css-purge removes all unused selectors from each file and **all of the files it imports**. this way unused selectors are remove directly from your source code.
   

## **🧪 Example**

Before (\_buttons.scss):
```scss
.btn {  
  padding: 10px;

  &-primary {  
    background: blue;  
  }

  &-danger {  
    background: red;  
  }  
}
```

After purge (if only .btn-primary is used):

```scss
.btn {  
  padding: 10px;

  &-primary {  
    background: blue;  
  }  
}
```

## **⚠️ Caveats**

* **Dynamic class names** (e.g., className={\\btn-${type}\`}\`) may not be detected automatically. You can whitelist them manually.  
* Algorithm **cannot** detect classnames inside sass mixins. unused selectors inside mixins cannot be detected.  
* Run on a clean Git branch to prevent losing code unintentionally.  
* Purging directly modifies Sass files. Make sure you have version control enabled.

## **📜 License**

MIT License © 2025 Pooyan Salmani