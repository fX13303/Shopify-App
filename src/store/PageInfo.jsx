import { atom } from "recoil";

const pageInfo = atom({
    key: 'pageinfo',
    default: {
        title: '',
        content: ''
    }
})

export default pageInfo