
namespace Follow
{
	const attrName = "data-follow";
	const metaKey = "recommended-readers";
	
	/**
	 * The list of data types to attempt to copy to the clipboard.
	 * 
	 * Some browsers (Chrome) don't allow text/uri-list copied
	 * on write, so we fall back to text/plain in this case.
	 */
	export const types = ["text/uri-list", "text/plain"];
	
	/**
	 * Opens a follow dialog.
	 */
	export async function open(...feedUrls: string[])
	{
		if (feedUrls.length === 0)
			return;
		
		feedUrls = feedUrls.map(url => "html://follow?" + url);
		
		const href = window.location.href;
		feedUrls = feedUrls.map(s => new URL(s, href).toString());
		const text = feedUrls.join("\n");
		
		for (const type of types)
		{
			try
			{
				const blob = new Blob([text], { type });
				const data = [new ClipboardItem({ [type]: blob })];
				await navigator.clipboard.write(data);
			}
			catch (e)
			{
				continue;
			}
			
			break;
		}
		
		// Display the dialog
		
		const isDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
		const screenDiv = document.createElement("div");
		{
			const s = screenDiv.style;
			const sa = s as any;
			
			s.position = "fixed";
			s.top = s.right = s.bottom = s.left = "0";
			s.zIndex = "99999";
			s.backgroundColor = "rgba(128, 128, 128, 0.5)";
			s.fontFamily = "-apple-system, BlinkMacSystemFont, avenir next, avenir, segoe ui, helvetica neue, helvetica, Ubuntu, roboto, noto, arial, sans-serif";
			sa.webkitBackdropFilter = sa.backdropFilter = "blur(3px)";
		}
		
		const dialogDiv = document.createElement("div");
		{
			const s = dialogDiv.style;
			s.position = "absolute";
			s.top = s.right = s.bottom = s.left = "0";
			s.width = s.height = "fit-content";
			s.margin = "auto";
			s.backgroundColor  = isDark ? "black" : "white";
			s.color = isDark ? "white" : "black";
			s.borderRadius = "12px";
			s.padding = "20px";
			s.boxShadow = "0 10px 15px rgba(0, 0, 0, 0.1)";
		}
		
		const p = document.createElement("p");
		p.textContent = "You need an HTML feed reader app. Do you have one?";
		p.style.marginTop = "0";
		
		const aNo = document.createElement("a");
		aNo.textContent = "No, Get One Now";
		aNo.href = getRecommendedReader();
		
		const aYes = document.createElement("a");
		aYes.textContent = "Yes";
		
		// The first feed URL is placed at the end of the html:// URI, but this is only as an insurance
		// measure. The URLs are copied to the clipboard, and the recipient apps should examine the
		// clipboard rather than relying only on the suffix of the HTML protocol. This is only to handle
		// the case that the clipboard transfer fails--at least in this case, the first follow URL will
		// be transferred (and 99.99% of follows will involve only a single source).
		aYes.href = feedUrls[0];
		
		const sn = aNo.style;
		const sy = aYes.style;
		
		sn.color = sy.color = "blue";
		sn.textAlign = sy.textAlign = "center";
		sn.textDecoration = sy.textDecoration = "none";
		sy.float = "right";
		
		dialogDiv.append(p, aNo, aYes);
		const screenShadow = screenDiv.attachShadow({ mode: "open" });
		screenShadow.append(dialogDiv);
		document.body.append(screenDiv);
	}
	
	/**
	 * An key-value object where the keys are platforms and the values are
	 * URLs where the platform-specific HTML Reels reader app can be
	 * downloaded.
	 */
	export interface IReaders
	{
		ios: string;
		android: string;
		macos: string;
		windows: string;
		linux: string;
	}
	
	/** */
	export function setRecommendedReaders(readers: Partial<IReaders>)
	{
		const out: IReaders = Object.assign({}, defaultReaders, readers);
		const string = Object.entries(out).map(([k, v]) => k + "=" + v).join(" ");
		
		let meta = getMeta();
		if (!meta)
		{
			meta = document.createElement("meta");
			meta.setAttribute("name", metaKey);
			document.head.append(meta);
		}
		
		meta.setAttribute("content", string);
	}
	
	/**
	 * Returns the recommended reader for the detected platform.
	 */
	export function getRecommendedReader()
	{
		const readers = getRecommendedReaders();
		const ua = navigator.userAgent;
		const platform = (navigator as any).userAgentData?.platform || navigator.platform || "";
		
		if (/Android\s+/.test(ua))
			return readers.android;
		
		if (platform.startsWith("iP"))
			return readers.ios;
			
		if (platform.startsWith("Mac"))
			return readers.macos;
		
		if (/win/.test(platform))
			return readers.windows;
		
		return readers.linux;
	}
	
	/**
	 * Returns an object that contains the recommended readers
	 * for each individual platform.
	 */
	export function getRecommendedReaders()
	{
		const out: IReaders = Object.assign({}, defaultReaders);
		
		let meta = getMeta();
		if (meta)
		{
			const pairs = meta.getAttribute("content")?.split(/\s+/g) || [];
			const kv = pairs.map(s => s.split(/=/));
			
			for (const [k, v] of kv)
				if (k in out)
					out[k as keyof IReaders] = v;
		}
		
		return out;
	}
	
	/** */
	function getMeta()
	{
		return document.head.querySelector(`META[name=${metaKey}]`);
	}
	
	/** */
	const defaultReaders: IReaders = {
		ios: "",
		android: "",
		macos: "",
		windows: "",
		linux: "",
	};
	
	// Bootstrap
	
	const setup = () =>
	{
		const qsa = document.querySelectorAll(`A[${attrName}]`);
		const anchors = Array.from(qsa) as HTMLAnchorElement[];
		for (const anchor of anchors)
			connectAnchor(anchor);
	};
	
	const connectAnchor = (anchor: HTMLAnchorElement) =>
	{
		if (!anchor.href)
			anchor.href = "#";
		
		anchor.addEventListener("click", () =>
		{
			const attr = anchor.getAttribute(attrName) || "";
			const urls = attr.split(/\s+/g);
			open(...urls);
		});
	}
	
	if (document.readyState === "loading")
	{
		const ev = () =>
		{
			document.removeEventListener("readystatechange", ev);
			setup();
		};
		
		document.addEventListener("readystatechange", ev);
	}
	else setup();
}

//@ts-ignore
if (typeof module === "object") Object.assign(module.exports, { Follow });