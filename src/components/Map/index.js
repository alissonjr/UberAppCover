import React, { Component } from 'react';
import { View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import { getPixelSize } from '../../utils';

import Search from '../Search';
import Directions from '../Directions';

import markerImage from "../../assets/marker.png";

import { LocationBox, LocationText, LocationTimeBox, LocationTimeText, LocationTimeTextSmall } from "./styles";

import Details from '../Details';

Geocoder.init('AIzaSyAvrhMaVhxo8Dv9GIpdgTHN4AzokXOzuRo');

export default class Map extends Component {
    state = {
        region: null,
        destination: null,
        duration: null,
        location: null
    };

    async componentDidMount() {
        navigator.geolocation.getCurrentPosition(
            async ({ coords: { latitude, longitude } }) => {
                const response = await Geocoder.from({ latitude, longitude });
                const address = response.results[0].formatted_address;
                const location = address.substring(0, address.indexOf(','));

                this.setState({
                    location,
                    region: {
                        latitude,
                        longitude,
                        latitudeDelta: 0.0,
                        longitudeDelta: 0.0
                    }
                });
            }, // sucesso
            () => {}, // erro
            {
                timeout: 2000,
                enableHighAccuracy: true,
                maximumAge: 1000,
            }
        )
    }

    handleLocationSelected = (data, { geometry }) => {
        const { location: { lat: latitude, lng: longitude } } = geometry;

        this.setState({
            destination: {
                latitude,
                longitude,
                title: data.structured_formatting.main_text,
            }
        })
    }

    render() {
        const { region, destination, duration, location } = this.state;
        return (
            <View style={{ flex: 1 }}>
                <MapView
                    style={{ flex: 1 }}
                    region={region}
                    showsUserLocation
                    loadingEnabled
                    ref={el => this.MapView = el}
                >
                { destination && (
                    <React.Fragment>
                        <Directions
                            origin={region}
                            destination={destination}
                            onReady={(result) => {
                                this.setState({ duration: Math.floor(result.duration) })
                                this.MapView.fitToCoordinates(result.coordinates, {
                                    edgePadding: {
                                        right: getPixelSize(50),
                                        top: getPixelSize(50),
                                        left: getPixelSize(50),
                                        bottom: getPixelSize(350)
                                    }
                                });
                            }}
                        />
                        <Marker
                            coordinate={destination}
                            anchor={{ x: 0, y: 0 }}
                            image={markerImage}
                        >
                            <LocationBox>
                                <LocationText>{destination.title}</LocationText>
                            </LocationBox>
                        </Marker>

                        <Marker
                            coordinate={region}
                            anchor={{ x: 0, y: 0 }}
                        >
                            <LocationBox>
                                <LocationTimeBox>
                                    <LocationTimeText>{duration}</LocationTimeText>
                                    <LocationTimeTextSmall>MIN</LocationTimeTextSmall>
                                </LocationTimeBox>
                                <LocationText>{location}</LocationText>
                            </LocationBox>
                        </Marker>
                    </React.Fragment>
                ) }
                </MapView>

                { destination ? <Details /> : <Search onLocationSelected={this.handleLocationSelected} /> }
            </View>
        );
    }
}
