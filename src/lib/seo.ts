export const seo = (title: string, description: string) => ({
  meta: [
    { title: `${title} — mercado.` },
    { name: "description", content: description },
    { property: "og:title", content: `${title} — mercado.` },
    { property: "og:description", content: description },
  ],
});
