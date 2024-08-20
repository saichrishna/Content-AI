import { isObject, isEmpty, isArray, uniqBy } from "lodash";
import { message } from "antd";
export const errorhandling = (error: any) => {
  let errorMessage = "";
  if (error?.response?.data && isObject(error?.response?.data)) {
    if (error?.response?.data?.errors) {
      errorMessage = Object.keys(error?.response?.data?.errors)
        .map(
          (item) =>
            `${item}: ${error?.response?.data?.errors?.[item]?.join(", ")}`
        )
        .join(", ");
      message.error(errorMessage, 3);
    } else if (error?.response?.data?.detail || error?.response?.data?.title) {
      errorMessage = (
        error?.response?.data?.detail ||
        error?.response?.data?.title ||
        ""
      ).trim();
      message.error(errorMessage, 3);
    }
  } else if (error?.response?.data) {
    errorMessage = error?.response?.data;
    message.error(errorMessage, 3);
  }
  return errorMessage;
};
