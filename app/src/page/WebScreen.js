import React, {Component} from 'react';
import {
    StyleSheet,
    Text,
    WebView,
    Image,
    View,
    TouchableOpacity,
} from 'react-native';
import ScManager from "../util/ScManager";
import {PubSub} from 'pubsub-js';
import TitleRight from "../component/TitleRight";
import HttpUtil from "../util/HttpUtil";

let global = require('../global');
let url = 'http://reader.smartisan.com/index.php';

export default class WebScreen extends Component {


    static navigationOptions = ({navigation}) => ({
        headerRight: <TitleRight nav={navigation} artInfo={navigation.state.params.data}/>

    });

    constructor() {
        super();
        this.state = {
            isSc: false,
        };
    }

    componentDidMount() {
        const {params} = this.props.navigation.state;
        ScManager.getScIdList(data => {
            if (data.length > 0) {
                data.map((item) => {
                    if (params.data.site_info.id === item) {
                        this.setState({isSc: true});
                    }
                });
            }
        });
    }

    getCateInfo(id, name) {
        let params = {r: 'site/GetInfoById', site_id: id};
        HttpUtil.get(url, params, data => {
            if (data.code === 0) {
                ScManager.addScSite(data.data);
                this.setState({isSc: true});
                PubSub.publish(name, true);
            }
        })
    }

    render() {
        const {params} = this.props.navigation.state;
        let siteInfo = params.data.site_info;
        return (
            <View style={{flex: 1}}>
                <View style={styles.scContainer}>
                    <Image style={styles.siteImg} source={{uri: siteInfo.pic}}/>
                    <Text style={styles.siteName}>{siteInfo.name}</Text>
                    <TouchableOpacity onPress={() => {
                        this.onSc(siteInfo)
                    }}>
                        <Text style={styles.scBtn}>{this.state.isSc ? '已订阅' : '订阅'}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.webContainer}>
                    <WebView
                        javaScriptEnabled={true}
                        startInLoadingState={true}
                        source={{uri: params.data.origin_url}}/>
                </View>
            </View>
        )
    }

    onSc(siteInfo) {
        if (this.state.isSc) {
            ScManager.removeScSiteById(siteInfo.id);
            this.setState({isSc: false});
            PubSub.publish(siteInfo.name, false);
        } else {
            this.getCateInfo(siteInfo.id, siteInfo.name);
        }

    }
}


const styles = StyleSheet.create({
    webContainer: {
        flex: 1,
    },
    scContainer: {
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
        paddingRight: 20,
        paddingLeft: 20,
        paddingTop: 12,
        paddingBottom: 12,
    },
    sc: {
        flex: 0
    },
    siteImg: {
        width: 18,
        height: 18,
        marginRight: 6,
        borderRadius: 9
    },
    siteName: {
        flex: 1,
    },
    scBtn: {
        borderWidth: 0.5,
        borderColor: global.lineColor,
        borderRadius: 4,
        paddingLeft: 12,
        paddingRight: 12,
        paddingTop: 4,
        paddingBottom: 4,
        fontSize: 12
    }
});