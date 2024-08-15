import { Gallery } from "./gallery.model";
import { User } from "./user.model";

export class Event {
  constructor(
    public id: string,
    public name: string,
    public date: Date,
    public location: string,
    public description: string,
    public price: number,
    public attendees: User[],
    public images: Gallery[],
    public isPrivate: boolean = false,
    public slug?: string
  ) {}
}