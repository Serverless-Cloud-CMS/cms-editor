export interface CatalogEntry {
  catalog_id: string;
  catalog_title: string;
  catalog_image_key: string;
  catalog_description: string;
  published: boolean;
  created_at: string;
}

export interface CatalogPublishEventDetail {
  catalog_id: string;
  catalog_title: string;
  catalog_image_key: string;
  catalog_description: string;
  source: string;
}