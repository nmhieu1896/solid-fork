import {
  Signal,
  createContext,
  createEffect,
  createSignal,
  splitProps,
  useContext
} from "solid-js";
import z from "zod";

type Props = {
  validator: z.ZodObject<any>;
  defaultValues?: Signal<any>[0];
};

const formContext = createContext<any>();
export const useForm = () => useContext(formContext);

export function createForm({ validator, defaultValues }: Props) {
  const [errors, setErrors] = createSignal({});
  const [formValues, setFormValues] = createSignal({}, { equals: false });
  const inputMap = new Map();
  const setInternalValue = (name: string, value: any) =>
    setFormValues(formValues => (setValueFor(formValues)(name, value), formValues));

  const setValue = (name: string, value: any) => {
    inputMap.get(name).set(value);
  };
  const getValue = (name: string) => {
    return getNestedValue(formValues())(name);
  };

  const register = (name: string) => (ref: HTMLInputElement) => {
    const signal = createSignal();
    inputMap.set(name, { get: signal[0], set: signal[1], ref });
    const [value] = signal as Signal<any>;
    const defaultValue = () => defaultValues()[name];
    const specificValidator = validator.pick({ [name]: true });

    ref.oninput = (e: any) => {
      //update formValues signal
      setInternalValue(name, e.target.value);

      const result = specificValidator.safeParse({ [name]: e.target.value });
      if (result.success === false) {
        setErrors(errors => ({ ...errors, [name]: result.error.issues[0].message }));
      } else {
        setErrors(errors => ({ ...errors, [name]: undefined }));
      }
    };

    createEffect(() => {
      ref.defaultValue = defaultValue() || "";
      //update formValues signal
      setInternalValue(name, ref.value);
    });

    createEffect(() => {
      if (!value()) return;
      //update DOM Values
      ref.value = value() || "";
      //update formValues signal
      setInternalValue(name, value());
    });
  };

  //@ts-ignore
  window.inputMap = inputMap;

  const handleSubmit = (callback: (data: any) => void) => (e: any) => {
    e.preventDefault();
    const result = validator.safeParse(formValues());
    if (result.success === true) {
      callback(formValues());
    } else {
      const error = {};
      let inputNameForFocus = "";

      result.error.issues.forEach((issue, idx) => {
        const inputName = issue.path[0] as string;
        error[inputName] = issue.message;
        // focus on first error or the one that is currently focused
        if (idx === 0 || document.activeElement === inputMap.get(inputName).ref)
          inputNameForFocus = inputName;
      });
      if (inputNameForFocus) inputMap.get(inputNameForFocus).ref.focus();

      setErrors(error);
    }
  };
  return { getValue, setValue, inputMap, register, errors, setErrors, formValues, handleSubmit };
}

export const FormProvider = (props: any) => {
  const [childrenProp, restProps] = splitProps(props, ["children"]);
  return <formContext.Provider value={restProps}>{childrenProp.children}</formContext.Provider>;
};

type InjectObjectArgsType = {
  name: Array<string | number>;
  value: unknown;
  obj: Record<string, any>;
};
export function injectValuesToObject({ name, value, obj = {} }: InjectObjectArgsType): unknown {
  if (name.length === 1) return (obj[name[0]] = value);
  const curName = name.shift() as string | number;
  // Create initial reference if current value is undefined
  if (!obj[curName]) {
    obj[curName] = Number.isInteger(+name[0]) ? [] : {};
  }
  return injectValuesToObject({ name, value, obj: obj[curName] });
}

const setValueFor = (obj: Record<string, any>) => (name: string, value: any) => {
  if (name.includes(".")) {
    injectValuesToObject({ name: name.split("."), value, obj });
  } else {
    obj[name] = value;
  }
};

const getNestedValue = (obj: Record<string, any>) => (name: string) => {
  if (name.includes(".")) {
    const [first, ...rest] = name.split(".");
    return getNestedValue(obj[first])(rest.join("."));
  }
  return obj?.[name] ?? undefined;
};
