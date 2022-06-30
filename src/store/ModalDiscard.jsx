import { atom } from "recoil";

const modalDiscardState = atom({
  key: "modaldiscard", // unique ID (with respect to other atoms/selectors)
  default: false, // default value (aka initial value)
});

export default modalDiscardState;
