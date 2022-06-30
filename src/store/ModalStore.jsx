import { atom } from "recoil";

const modalDeleteState = atom({
  key: "modaldelete", // unique ID (with respect to other atoms/selectors)
  default: false, // default value (aka initial value)
});

export default modalDeleteState;
