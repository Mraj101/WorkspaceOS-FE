const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
const dateTime = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });

export const formatPrice = (value: number) => currency.format(value);
export const formatDate = (iso: string) => dateTime.format(new Date(iso));

export const categoryLabel = (category: string) =>
  category.charAt(0).toUpperCase() + category.slice(1);
