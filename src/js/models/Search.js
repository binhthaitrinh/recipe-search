// export default 'I am an exported string.';
import axios from 'axios';
export default class Search {
    constructor(query) {
        this.query = query;
    }
    async getResults() {
        const key = '1518af63ae99a41a31173cca858f1e5d';
        try {
            const res = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
            this.result = res.data.recipes;
            
            // console.log(this.result);
        }
        catch(err) {
            console.log(err);
        }
        
        
    }
}


