export const creditUsageEstimate = (
  fromDate: Date,
  toDate: Date,
  isDownloadFiles: boolean,
) => {
  const months =
    (toDate.getFullYear() - fromDate.getFullYear()) * 12 +
    (toDate.getMonth() - fromDate.getMonth()) +
    1;
  let creditsToDeduct = months * 3; // 1 month = 3 credit

  if (isDownloadFiles) {
    creditsToDeduct *= 1.5;
  }

  return Math.round(creditsToDeduct);
};
