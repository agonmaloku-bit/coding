import Dropdown from '../../../../Components/Dropdown/Dropdown.vue';
import user1Image from 'admin-lte/dist/img/user1-128x128.jpg';
import user8Image from 'admin-lte/dist/img/user8-128x128.jpg';

export default {
    name: "Messages",
    components: {
        'app-dropdown': Dropdown
    },
    data() {
        return {
            user1Image,
            user8Image
        };
    }
}