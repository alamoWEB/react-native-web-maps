import React, { Component } from 'react';
import { Marker } from 'react-google-maps';

class MapViewMarker extends Component {
  state = {
    isOpen: false,
  };
  showCallout() {
    this.setState({ isOpen: true });
  }
  hideCallout() {
    this.setState({ isOpen: false });
  }
  render() {
    const { map, description, title, coordinate, onPress, icon, ...rest } = this.props;

    const childrenWithProps = React.Children.map(this.props.children, child => {
      return React.cloneElement(child, { hideCallout: this.hideCallout.bind(this) });
    });

    const customIcon = icon ? {
      ...icon,
      url: icon.uri ? icon.uri : icon.url,
      scaledSize: icon.scaledSize ? new map.Size(icon.scaledSize.width, icon.scaledSize.height) : undefined
    } : undefined

    return (
      <Marker
        {...rest}
        title={description ? `${title}\n${description}` : title}
        position={{ lat: coordinate.latitude, lng: coordinate.longitude }}
        onClick={onPress}
        icon={customIcon}
      >
        {this.state.isOpen && childrenWithProps}
      </Marker>
    );
  }
}

export default MapViewMarker;
