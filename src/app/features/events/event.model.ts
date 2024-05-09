import { Gallery } from "../gallery/gallery.model";
import { User } from "../user.model";

export class Event {
  constructor(
    public id: string,
    public name: string,
    public date: Date,
    public isVirtual: boolean,
    public location: string,
    public description: string,
    public attendees: User[],
    public isRegistrationOpen: boolean,
    public images: Gallery[]
    
  ) {}
}