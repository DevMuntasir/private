
import { useForm } from 'vee-validate';

/**
 * Applies backend validation errors to VeeValidate form fields
 * @param errors 
 */
export function useApplyBackendErrors() {
  const { setFieldError } = useForm();

  function applyBackendErrors(errors: Record<string, string[]>) {
    if (!errors || typeof errors !== 'object') return;

    Object.entries(errors).forEach(([field, messages]) => {
      if (Array.isArray(messages) && messages.length > 0) {
        setFieldError(field, messages[0]); 
      }
    });
  }

  return { applyBackendErrors };
}
