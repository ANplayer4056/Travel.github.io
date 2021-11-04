var app = new Vue({
    el: '#app',
    data: {
        attractions: [],
        areaList: [],
        hotels: [],
        youbikes: [],
        selectArea: '全景點',
        selectHotel: {},
    },
    mounted() {
        this.getDatas();
    },
    computed: {
        renderAttractions() {
            if (this.selectArea === '全景點') {
                return this.attractions;
            } else {
                return this.attractions.filter(ele => ele.Add.match(this.selectArea))
            }
        },
        renderHotels() {
            if (this.selectArea === '全景點') {
                return this.hotels;
            } else {
                return this.hotels.filter(ele => ele.鄉鎮.match(this.selectArea))
            }
        },
        hasPlanning() {
            if (JSON.stringify(this.selectHotel) === '{}') {
                return false;
            } else {
                return true;
            }
        },
        nearAttractions() {

            // 飯店位置
            let lon1 = this.selectHotel.經度Lng;
            let lat1 = this.selectHotel.緯度Lat;

            //計算景點離飯店的距離
            this.renderAttractions.forEach(ele => {
                let lon2 = ele.Px;
                let lat2 = ele.Py;

                let tmp = this.distance(lat1, lon1, lat2, lon2);
                ele.betweens = Math.floor(tmp * 100) / 100;
            })

            // 處理景點附近的 youbikes
            this.renderAttractions.forEach(ele => {
                let lon2 = ele.Px;
                let lat2 = ele.Py;
                ele.bikes = [];

                this.renderBikes.forEach(bike => {
                    let lon3 = bike.lng;
                    let lat3 = bike.lat;
                    let tmp2 = this.distance(lat3, lon3, lat2, lon2);
                    tmp2 = Math.floor(tmp2 * 100) / 100;
                    if (tmp2 < 1) ele.bikes.push(bike);
                })
            })
            return this.renderAttractions;
        },
        renderBikes() {
            if (this.selectArea === '全景點') {
                return this.youbikes;
            } else {
                return this.youbikes.filter(ele => ele.sarea.match(this.selectArea))
            }
        }
    },
    methods: {
        getDatas() {

            // 取得旅遊景點
            axios.get("https://api.kcg.gov.tw/api/service/Get/9c8e1450-e833-499c-8320-29b36b7ace5c").then(res => {
                this.attractions = res.data.data.XML_Head.Infos.Info;
                this.getAreaList();
            }).catch(error => { })

            // 取得旅館資料
            axios.get("https://api.kcg.gov.tw/api/service/Get/8ed53368-e292-4e2a-80a7-434cf497220c").then(res => {
                this.hotels = res.data.data;
            }).catch(error => { })

            // 取得 YouBike資料
            axios.get("https://api.kcg.gov.tw/api/service/Get/b4dd9c40-9027-4125-8666-06bef1756092").then(res => {
                this.youbikes = res.data.data.retVal;
            }).catch(error => { })
        },
        getAreaList() {
            this.attractions.forEach(ele => {
                let areaName = ele.Add.substring(6, 9);
                if (!this.areaList.includes(areaName)) this.areaList.push(areaName);
            })
        },
        setArea(item) {
            // 選擇地區
            this.selectArea = item;
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
        },
        setHotel(item) {
            // 選擇飯店
            this.selectHotel = item;
            this.selectHotel.bikes = [];

            // 飯店位置
            let lon1 = item.經度Lng;
            let lat1 = item.緯度Lat;

            // 提供附近 youbike 站點
            this.renderBikes.forEach(bike => {
                let lon3 = bike.lng;
                let lat3 = bike.lat;
                let tmp2 = this.distance(lat1, lon1, lat3, lon3);
                tmp2 = Math.floor(tmp2 * 100) / 100;
                if (tmp2 < 0.3) this.selectHotel.bikes.push(bike);
            })

        },
        distance(lat1, lon1, lat2, lon2) {
            if ((lat1 == lat2) && (lon1 == lon2)) {
                return 0;
            }
            else {
                let radlat1 = Math.PI * lat1 / 180;
                let radlat2 = Math.PI * lat2 / 180;
                let theta = lon1 - lon2;
                let radtheta = Math.PI * theta / 180;
                let dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
                if (dist > 1) {
                    dist = 1;
                }
                dist = Math.acos(dist);
                dist = dist * 180 / Math.PI;
                dist = dist * 60 * 1.1515;

                // 轉為公里
                dist = dist * 1.609344;
                return dist;
            }
        },
        reset() {
            this.selectHotel = {};
            this.selectArea = '全景點';
        }
    }
})