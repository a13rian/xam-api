export interface DaySchedule {
  open: string; // "09:00"
  close: string; // "18:00"
  isOpen: boolean;
}

export interface WorkingHoursData {
  monday?: DaySchedule;
  tuesday?: DaySchedule;
  wednesday?: DaySchedule;
  thursday?: DaySchedule;
  friday?: DaySchedule;
  saturday?: DaySchedule;
  sunday?: DaySchedule;
}

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

export class WorkingHours {
  private readonly _data: WorkingHoursData;

  private constructor(data: WorkingHoursData) {
    this._data = data;
  }

  public static create(data: WorkingHoursData): WorkingHours {
    return new WorkingHours(data);
  }

  public static empty(): WorkingHours {
    return new WorkingHours({});
  }

  public static fromJSON(json: WorkingHoursData | null): WorkingHours {
    if (!json) return WorkingHours.empty();
    return new WorkingHours(json);
  }

  public static defaultBusinessHours(): WorkingHours {
    const defaultSchedule: DaySchedule = {
      open: '09:00',
      close: '18:00',
      isOpen: true,
    };
    const closedSchedule: DaySchedule = {
      open: '09:00',
      close: '18:00',
      isOpen: false,
    };

    return new WorkingHours({
      monday: defaultSchedule,
      tuesday: defaultSchedule,
      wednesday: defaultSchedule,
      thursday: defaultSchedule,
      friday: defaultSchedule,
      saturday: defaultSchedule,
      sunday: closedSchedule,
    });
  }

  public getDay(day: DayOfWeek): DaySchedule | undefined {
    return this._data[day];
  }

  public isOpenOn(day: DayOfWeek): boolean {
    const schedule = this._data[day];
    return schedule?.isOpen ?? false;
  }

  public getOpenDays(): DayOfWeek[] {
    return DAYS_OF_WEEK.filter((day) => this.isOpenOn(day));
  }

  public isEmpty(): boolean {
    return Object.keys(this._data).length === 0;
  }

  public toJSON(): WorkingHoursData {
    return { ...this._data };
  }

  public equals(other: WorkingHours): boolean {
    return JSON.stringify(this._data) === JSON.stringify(other._data);
  }
}
