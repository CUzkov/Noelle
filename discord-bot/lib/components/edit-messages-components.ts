import {ActionRowBuilder, EmbedBuilder, MessageActionRowComponentBuilder} from '@discordjs/builders';
import {Collection, Message} from 'discord.js';

import {logger} from 'lib/logger';

import {Components} from './types';

type SendComponentsParams = {
    messages: Collection<string, Message<true>> | Collection<string, Message<false>>;
    components: Components[];
};

export const editMessagesComponents = async ({messages, components}: SendComponentsParams) => {
    if (messages.size !== components.length) {
        logger.fatal('Messages size not equal components lenght in editMessagesComponents');
        process.exit();
    }

    const editPromises = [];

    for (let i = 0; i < messages.size; i++) {
        const component = components[i];
        const message = messages.at(i);

        if (message && component instanceof EmbedBuilder) {
            editPromises.push(await message.edit({embeds: [component]}));
        }

        if (message && component instanceof ActionRowBuilder<MessageActionRowComponentBuilder>) {
            editPromises.push(await message.edit({components: [component]}));
        }
    }

    await Promise.all(editPromises);
};
