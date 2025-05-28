/* 
 * This file contains datatypes for JS objects passed around in the search and 
 * article pages. 
 */

export type LinkData = {name:string;url:string};

/// Type of response for GET /article/content
export type ArticleContentResponse = {
  label: string,
  shortDescription?: string,
  description?: string,
  body?: string,
  wikipediaLink?: string,
  googleLink?: string
}

/// Type of response for GET /article/images

export type ArticleImagesResponse = Image[]



export type SearchResponse = SingleSearchResponse[]

export type SingleSearchResponse = {
  id: string,
  label: string,
  shortDescription?: string,
  image?: Image
}
export type FeaturedArticlesResponse = SingleSearchResponse[]

export type Image = {
  url: string,
  altText?: string
}

