export const siteConfig = {
  title: "nextjs-csr",
  description: "nextjs-csr description",
  keywords: ["keywords", "keywords2"],
  og: {
    title: "nextjs-csr",
    description: "nextjs-csr",
    image: "https://nextjs-csr.com/pwa-512x512.png",
    url: "https://nextjs-csr.com",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "nextjs-csr",
    description: "nextjs-csr",
    image: "https://nextjs-csr.com/pwa-512x512.png",
  },
  jsonLd: {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OneFile",
    url: "https://nextjs-csr.com",
    description: "nextjs-csr.",
    publisher: {
      "@type": "Organization",
      name: "OneFile",
      logo: {
        "@type": "ImageObject",
        image: "https://nextjs-csr.com/pwa-512x512.png",
      },
    },
  },
} as const;
