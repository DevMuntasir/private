export function useDateTime() {
  const formatDate = (
    dateString: string,
    showTime = true
  ) => {
    try {
      const date = new Date(dateString);

      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "numeric",
      };

      if (showTime) {
        options.hour = "numeric";
        options.minute = "numeric";
        options.hour12 = true;
      }

      return new Intl.DateTimeFormat('en-US', options).format(date);
      //eslint-disable-next-line
    } catch (e: any) {
      return dateString;
    }
  };

  return { formatDate };
}
