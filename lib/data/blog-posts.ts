export interface BlogPost {
  slug: string;
  title: string;
  metaDescription: string;
  excerpt: string;
  content: string;
  category: "buying-tips" | "financing" | "maintenance" | "comparisons" | "local";
  tags: string[];
  datePublished: string;
  dateModified: string;
  author: string;
  readTime: number;
}

// TODO: Add full blog post content
export const blogPosts: BlogPost[] = [];
