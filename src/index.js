import React, { Component } from 'react';
import { View, StyleSheet } from 'react-native';
import { withGoogleMap, GoogleMap } from 'react-google-maps';

const GoogleMapContainer = withGoogleMap(props => (
  <GoogleMap {...props} ref={props.handleMapMounted} />
));

const googleToReact = (coords) => ({
  latitude: coords.lat(),
  longitude: coords.lng(),
});

const reactToGoogle = (coords) => ({
  lat: coords.latitude,
  lng: coords.longitude,
});

class MapView extends Component {
  state = {
    center: null,
  };

  handleMapMounted = map => {
    this.map = map;
    this.props.onMapReady && this.props.onMapReady();
  };

  getMapBoundaries = async () => {
    const bounds = this.map.getBounds();
    return {
      northEast: googleToReact(bounds.getNorthEast()),
      southWest: googleToReact(bounds.getSouthWest()),
    };
  }

  getCamera = async () => {
    return {
      zoom: this.map.getZoom(),
      center: this.map.getCenter(),
      heading: this.map.getHeading(),
    };
  };

  animateCamera(camera) {
    this.setState({ zoom: camera.zoom });
    this.setState({ center: camera.center });
  }

  animateToRegion(coordinates) {
    this.setState({
      center: reactToGoogle(coordinates),
    });
  }

  onDragEnd = () => {
    const { onRegionChangeComplete } = this.props;
    if (this.map && onRegionChangeComplete) {
      const center = this.map.getCenter();
      onRegionChangeComplete(googleToReact(center));
    }
  };

  render() {
    const { region, initialRegion, onRegionChange, onPress, options, defaultZoom, showsPointsOfInterest } = this.props;
    const { center } = this.state;
    const style = this.props.style || styles.container;

    const googleMapProps = center
      ? { center }
      : region
      ? {
          center: reactToGoogle(region),
        }
      : {
          defaultCenter: reactToGoogle(initialRegion),
        };
    const zoom =
      defaultZoom ||
      (region && region.latitudeDelta
        ? Math.round(Math.log(360 / region.latitudeDelta) / Math.LN2)
        : initialRegion && initialRegion.latitudeDelta
        ? Math.round(Math.log(360 / initialRegion.latitudeDelta) / Math.LN2)
        : 15);
    googleMapProps['zoom'] = this.state.zoom ? this.state.zoom : zoom;

    const childrenWithProps = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, { map: this.map });
    });

    return (
      <View style={style}>
        <GoogleMapContainer
          handleMapMounted={this.handleMapMounted}
          containerElement={<div style={{ height: '100%' }} />}
          mapElement={<div style={{ height: '100%' }} />}
          onZoomChanged={() => {
            this.setState({ zoom: this.map.getZoom() });
          }}
          {...googleMapProps}
          onDragStart={onRegionChange}
          onIdle={this.onDragEnd}
          defaultZoom={zoom}
          onClick={onPress}
          options={options}
          showsPointsOfInterest={showsPointsOfInterest}>
          {childrenWithProps}
        </GoogleMapContainer>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
  },
});

export default MapView;
export { default as Marker} from './Marker';
export { default as Polyline} from './Polyline';
export { default as Callout} from './Callout';
