import React, {useEffect, FC} from 'react';
import {Routes, Route} from 'react-router-dom';
import {Grid, Menu, Segment, Button} from 'semantic-ui-react';

export const App: FC = () => {
    const activeItem = 'bio';

    return (
        <Grid>
            <Grid.Column width={4}>
                <Menu fluid vertical tabular>
                    <Menu.Item
                        name="bio"
                        active={activeItem === 'bio'}
                        //   onClick={this.handleItemClick}
                    />
                    <Menu.Item
                        name="pics"
                        //   active={activeItem === 'pics'}
                        //   onClick={this.handleItemClick}
                    />
                    <Menu.Item
                        name="companies"
                        //   active={activeItem === 'companies'}
                        //   onClick={this.handleItemClick}
                    />
                    <Menu.Item
                        name="links"
                        //   active={activeItem === 'links'}
                        //   onClick={this.handleItemClick}
                    />
                </Menu>
            </Grid.Column>

            <Grid.Column stretched width={12}>
                <Segment>This is an stretched grid column. This segment will always match the tab height</Segment>
                <Button primary>awd</Button>
            </Grid.Column>
        </Grid>
    );
};
