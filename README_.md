# Sass Purger

A lightweight tool to automatically **purge unused CSS rules directly inside your Sass (`.scss`) files**.

This project combines:

* [css-purge](https://www.npmjs.com/package/css-purge) – CSS rule cleaner
* [glob](https://www.npmjs.com/package/glob) – File pattern matching
* [madge](https://www.npmjs.com/package/madge) – Dependency graph analyzer

With these, it scans your project, detects which selectors are actually used, and removes the rest — at the **Sass source level**, not just the compiled CSS.

---

## ✨ Features

* Purges unused selectors directly from `.scss` files.
* Supports complex dependency graphs (via `madge`).
* Flexible glob-based file matching.
* Helps keep Sass codebases clean and maintainable.
* Reduces final CSS bundle size.

---

## 📦 Installation

```bash
git clone https://github.com/your-username/sass-purger.git
cd sass-purger
npm install
```

---

## ⚡ Usage

Run the purger with:

```bash
node index.js
```

### Example configuration

```js
// config.js
export default {
  // Entry points for dependency scanning
  entries: [
    "src/index.js",
    "src/main.tsx"
  ],

  // Patterns for Sass files to scan & purge
  sassFiles: [
    "src/**/*.scss"
  ],

  // Patterns for files that contain selectors in use
  content: [
    "src/**/*.{js,ts,jsx,tsx,html}"
  ],

  // Optional: output backup copies before purge
  backup: true
}
```

---

## 🛠 How It Works

1. **Dependency analysis**
   Madge builds a dependency graph from your project’s entry points.

2. **Selector extraction**
   Files matched in `content` are scanned for CSS selectors in use.

3. **Purging Sass**
   css-purge removes all unused selectors directly inside `.scss` files matched in `sassFiles`.

4. **Output**

   * If `backup` is enabled → keeps original `.scss` in `.bak` files.
   * Writes purged Sass back to the original location.

---

## 🧪 Example

Before (`_buttons.scss`):

```scss
.btn {
  padding: 10px;
}

.btn-primary {
  background: blue;
}

.btn-danger {
  background: red;
}
```

After purge (if only `.btn-primary` is used):

```scss
.btn {
  padding: 10px;
}

.btn-primary {
  background: blue;
}
```

---

## ⚠️ Caveats

* **Dynamic class names** (e.g., `className={\`btn-\${type}\`}\`) may not be detected automatically. You can whitelist them manually.
* Run on a clean Git branch or enable `backup` to prevent losing code unintentionally.
* Purging directly modifies Sass files. Make sure you have version control enabled.

---

## 🤝 Contributing

PRs, bug reports, and feature requests are welcome!

1. Fork the repo
2. Create a feature branch
3. Commit your changes
4. Open a PR

---

## 📜 License

MIT License © 2025 \Pooyan Salmani

---