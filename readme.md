# Syndi Button

This repository contains a library that renders *Subscribe* buttons on websites, allowing visitors to subscribe to feeds in the HTML Syndication format. The library displays a modal with a best-we-can-do UX, which asks the user if they have a compliant HTML Reader app installed, and gives them to the download page of a compliant app if they don't.

## Installation

Paste this script tag at the **bottom** of your HTML page:

```html
<script src="https://cdn.jsdelivr.net/npm/syndi-button/syndi-button.min.js"></script>
```

In order to create a button, create a hyperlink with the `data-reels-subscribe` attribute populated the feed URLs as shown below:

```html
<a href="#" data-reels-subscribe="http://a.com/path-to-feed/">Subscribe!</a>
```

You can subscribe to multiple feeds at once by specifying a space-separated list of feed URLs:

```html
<a href="#" data-reels-subscribe="http://a.com/path-to-feed/ http://b.com/path-to-feed/">Subscribe!</a>
```

## Changing The Recommended Reader

In order for an end user to be able to subscribe to an HTML Syndication, they must have a compatible reader app installed on their device. You can configure what reader you recommend to your users by including a `<meta>` tag in the `<head>` section of your HTML, as shown below. 

The meta tag is a space-separated list of key=value pairs, where the key is a well-known string that specifies the platform, and the URL is a download URL where the reader app can be found.

If no such tag exists, this library defaults to using the download URLs for [Rail](https://github.com/paul-go/Rail).

```html
<meta name="recommended-readers" content="
	ios=https://itunes.apple.com/app/id1234
	android=http://play.google.com/store/apps/details?id=com.app.name
	macos=http://myapp.com/app.dmg
	windows=http://myapp.com/app.msi
	linux=http://myapp.com/app.tar.gz
">
```

## Programmatic Usage

```typescript
// Pass one or more arguments to the SyndiButton.subscribe function
// in order to display the dialog:
SyndiButton.subscribe(
	"http://a.com/path-to-feed/",
	"http://b.com/path-to-feed/",
	...
);

// Configure recommended readers:

SyndiButton.setRecommendedReaders({
	ios: "https://itunes.apple.com/app/id1234",
	android: "http://play.google.com/store/apps/details?id=com.app.name",
	macos: "http://myapp.com/app.dmg",
	windows: "http://myapp.com/app.msi",
	linux: "http://myapp.com/app.tar.gz",
});
```
