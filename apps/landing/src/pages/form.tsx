import { FormProvider, createForm, useForm } from "../primitives/createForm";
import { For, Show, createEffect, createSignal, onMount } from "solid-js";
import z, { set } from "zod";

const validator = z.object({
  fname: z.string().min(4).max(20),
  // lname: z.string().min(4).max(10),
  address: z.string().min(1).max(50),
  // phone: z.coerce
  //   .number({ invalid_type_error: "Phone number only contain number" })
  //   .min(1000000, { message: "Phone number must be at least 7 digits" }),
  note: z.string().min(1)
  // info: z.string().min(1),
});

export default function () {
  const [defaultValues, setDefaultValues] = createSignal({});
  const formMethods = createForm({ validator, defaultValues });
  const { handleSubmit } = formMethods;
  const { getValue, setValue, errors, setErrors } = formMethods;

  onMount(() => {
    setTimeout(() => {
      setDefaultValues({
        fname: "John",
        address: "Old address",
        note: "Old note",
        "cousine.0.name": "Cousine1",
        "random.0": "why??"
      });
    }, 1500);
    setTimeout(() => {
      setDefaultValues({
        fname: "New John",
        address: "New Address",
        note: "New note",
        "cousine.0.name": "Cousine1111",
        "random.0": "why?????????"
      });
    }, 3000);
    setTimeout(() => {
      setDefaultValues({
        fname: "Another John",
        address: "Another Address",
        note: "Another note",
        "cousine.0.name": "Cousine11111111",
        "random.0": "why?????????????"
      });
    }, 4500);
  });

  const onSubmit = handleSubmit(data => {
    console.log({ data });
  });

  createEffect(() => {
    const isError = (getValue("fname")?.length || 0) + (getValue("lname")?.length || 0) > 15;
    const message = isError
      ? "First name and last name must be less than 15 characters"
      : undefined;
    setTimeout(() =>
      formMethods.setErrors(errors => ({ ...errors, fname: message, lname: message }))
    );
  });
  createEffect(() => {
    const isValid = getValue("list.0") || getValue("list.1") || getValue("list.2");
    const message = "At least one list must be filled";
    setTimeout(() =>
      setErrors(errors => ({
        ...errors,
        "list.0": isValid ? undefined : message,
        "list.1": isValid ? undefined : message,
        "list.2": isValid ? undefined : message
      }))
    );
  });

  return (
    <FormProvider {...formMethods}>
      <form
        onSubmit={onSubmit}
        class="grid grid-cols-3 gap-x-10 gap-y-4 w-[800px] items-start border border-green-400 mx-auto"
      >
        <MyInput name="fname" label="First name" />
        <MyInput name="lname" label="Last name" />
        <MyInput name="address" label="Address" />
        <MyInput name="phone" label="Phone number" />
        <MyInput name="note" label="Notes" />
        <MyInput name="info" label="Information" />
        <MyInput name="list.0" label="List 0" />
        <MyInput name="list.1" label="List 1" />
        <MyInput name="list.2" label="List 2" />
        <MyInput name="cousine.0.name" label="Cousine 0 name" />
        <MyInput name="cousine.1.name" label="Cousine 1 name" />
        <MyInput name="cousine.2.name" label="Cousine 2 name" />
        <For each={Array.from(Array(60))}>
          {(_, index) => <MyInput name={`random.${index()}`} label={`List ${index()}`} />}
        </For>
        <button class="border border-blue-400 p-4 mt-8">Submit</button>
      </form>
    </FormProvider>
  );
}

type InputProps = {
  name: string;
  label: string;
  defaultValue?: string;
};

function MyInput(props: InputProps) {
  const { register, errors } = useForm();
  const error = () => errors()[props.name];

  return (
    <label class="grid gap-2">
      <span>{props.label}</span>
      <input
        ref={register(props.name)}
        classList={{
          "input input-bordered w-full": true,
          "border border-gray-800": !error(),
          "border border-red-500": !!error()
        }}
        name={props.name}
      />
      <Show when={error()}>
        <p class="text-red-500">{error()}</p>
      </Show>
    </label>
  );
}
