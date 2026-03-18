declare namespace Temporal {
  interface PlainDate {
    toString(): string;
    until(other: PlainDate): Duration;
    equals(other: PlainDate): boolean;
  }

  interface ZonedDateTime {}

  interface Instant {
    toZonedDateTimeISO(timeZone: string): ZonedDateTime;
  }

  interface Duration {
    readonly days: number;
  }

  interface PlainDateConstructor {
    from(date: string): PlainDate;
  }

  interface ZonedDateTimeConstructor {
    from(dateTime: string): ZonedDateTime;
  }

  interface InstantConstructor {
    from(instant: string): Instant;
  }

  interface Now {
    plainDateISO(): PlainDate;
  }

  const PlainDate: PlainDateConstructor;
  const ZonedDateTime: ZonedDateTimeConstructor;
  const Instant: InstantConstructor;
  const Now: Now;
}
