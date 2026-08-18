export type Service = {
  id: string;
  name: string;
  duration: number;
  price: number;
  icon: string;
};

export type WizardStep = 1 | 2 | 3 | 4;

export type BookingState = {
  step: WizardStep;
  service: string | null;
  dateIndex: number | null;
  time: string | null;
  name: string;
  phone: string;
  note: string;
  bookingCode: string | null;
};
