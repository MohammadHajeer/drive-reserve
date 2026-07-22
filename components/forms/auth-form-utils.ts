type AuthApiError = {
  code?: string;
  message?: string;
  fieldErrors?: Record<string, string[]>;
};

export type AuthApiResponse = {
  success?: boolean;
  message?: string;
  error?: AuthApiError;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function getFieldErrors(value: unknown) {
  if (!isRecord(value)) {
    return undefined;
  }

  const fieldErrors: Record<string, string[]> = {};

  for (const [fieldName, messages] of Object.entries(value)) {
    if (!Array.isArray(messages)) {
      continue;
    }

    const stringMessages = messages.filter(
      (message): message is string => typeof message === "string",
    );

    if (stringMessages.length > 0) {
      fieldErrors[fieldName] = stringMessages;
    }
  }

  return fieldErrors;
}

export async function parseAuthResponse(
  response: Response,
): Promise<AuthApiResponse> {
  try {
    const value: unknown = await response.json();

    if (!isRecord(value)) {
      return {};
    }

    const errorValue = value.error;
    const error = isRecord(errorValue)
      ? {
          code: getString(errorValue.code),
          message: getString(errorValue.message),
          fieldErrors: getFieldErrors(errorValue.fieldErrors),
        }
      : undefined;

    return {
      success: typeof value.success === "boolean" ? value.success : undefined,
      message: getString(value.message),
      error,
    };
  } catch {
    return {};
  }
}
