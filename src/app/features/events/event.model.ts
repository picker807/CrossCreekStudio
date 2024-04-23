export class Event {
  constructor(
    public id: string,
    public name: string,
    public date: Date,
    public isVirtual: boolean,
    public location: string,
    public description: string,
    public attendees: string[],
    public isRegistrationOpen: boolean,
    public imageUrl: string,
    
  ) {}
}