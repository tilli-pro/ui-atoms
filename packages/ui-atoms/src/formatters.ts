export function formatArktypeValidationMessage(message: string): string {
  const spaceIndex = message.indexOf(" ");
  const firstWord = spaceIndex < 0 ? message : message.slice(0, spaceIndex);
  const restOfMessage = spaceIndex < 0 ? "" : message.slice(spaceIndex);

  // find where the capital letter is (camelCase split point)
  let capitalLetterIndex = 0;
  for (let i = 1; i < firstWord.length; i++) {
    if (firstWord[i] >= "A" && firstWord[i] <= "Z") {
      capitalLetterIndex = i;
      break;
    }
  }

  const beforeCapital = firstWord.slice(
    0,
    capitalLetterIndex || firstWord.length,
  );
  const afterCapital = firstWord.slice(capitalLetterIndex);
  const formattedFirstWord =
    beforeCapital[0].toUpperCase() +
    beforeCapital.slice(1).toLowerCase() +
    (capitalLetterIndex ? ` ${afterCapital.toLowerCase()}` : "");

  return formattedFirstWord + restOfMessage;
}

export function getCurrencySymbol(
  locale: Intl.LocalesArgument | undefined = "en-US",
  currency: string | undefined = "USD",
) {
  // when `formatToParts` is called with no arguments, it returns the following:
  // [
  //   { type: 'currency', value: '$' },
  //   { type: 'nan', value: 'NaN' },
  // ]
  // we grab the currency symbol from the first array value
  // we call this with 0 to avoid issues with locales that use different decimal separators

  return Intl.NumberFormat(locale, {
    style: "currency",
    currency,
  }).formatToParts(0)[0].value;
}
