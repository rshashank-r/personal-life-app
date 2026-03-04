import React from 'react';
import { FlexWidget, TextWidget } from 'react-native-android-widget';

export function ProgressWidget({ pendingCount, completedCount }) {
    return (
        <FlexWidget
            style={{
                height: 'match_parent',
                width: 'match_parent',
                backgroundColor: '#0D0F14',
                borderRadius: 16,
                padding: 16,
                justifyContent: 'center'
            }}
        >
            <TextWidget text="Today's Progress" style={{ fontSize: 16, color: '#A0AEC0' }} />
            <TextWidget text={`${completedCount} Done / ${pendingCount} Pending`} style={{ fontSize: 20, color: '#00D4FF', marginTop: 8 }} />
        </FlexWidget>
    );
}
