export enum GalleryCategory {
  Spring = "Spring",
  Summer = "Summer",
  Winter = "Winter",
  Fall = "Fall"
}

// Define the model
export class Gallery {
  constructor(
    public id: string,
    public name: string,
    public description: string,
    public imageUrl: string,
    public category: GalleryCategory
  ) {}
}