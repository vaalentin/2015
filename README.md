# 2015, a WebGL experiment

## Instructions

### Out of the box

```
$ npm install
$ bower install
$ gulp build
$ gulp bundle
$ gulp serve
```

### In details

####  Before anything

```
$ npm install
$ bower install
```

#### For development

Set `debug` and `watch` to **true** in `package.json`.

```
$ gulp build
```

The project will now auto rebuild on save.

#### For production

Set `debug` and `watch` to **false** in `package.json`.

```
$ gulp build
$ gulp bundle
```

You can then grab the `index.html` at the root, and everything in `app` (except `src`).

#### To serve

```
$ gulp serve
```

Go to `localhost:8000`.
