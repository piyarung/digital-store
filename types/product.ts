export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  image_url: string;
  file_url?: string;
  created_at?: string;
}