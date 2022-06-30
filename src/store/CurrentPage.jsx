import {atom} from 'recoil';

const currentPageInfo = atom({
    key: 'currentpage',
    default: {
        title: '',
        body_html: ''
    }
})

export default currentPageInfo