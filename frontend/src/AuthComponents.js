
import React from 'react';
import { useAuthenticator, useTheme, View, Heading, Image, Button } from '@aws-amplify/ui-react';

export const AuthComponents = {
  Header() {
    const { tokens } = useTheme();
    return (
      <View
        textAlign="center"
        padding={tokens.space.large}
        backgroundColor={tokens.colors.background.primary}
      >
        <Image
          alt="SmartTrackApp"
          src="https://i.postimg.cc/BnyPBXs8/2-YURCjl-Imgur.png"
          style={{ width: "100%", height: "100%" }}
        />
      </View>
    );
  },

  SignIn: {
    Header() {
      const { tokens } = useTheme();
      return (
        <Heading
          padding={`${tokens.space.xl} 0`}
          level={3}
          color={tokens.colors.font}
          style={{ backgroundColor: tokens.colors.background.secondary }}
          textAlign="center"
        >
          Sign in to your account
        </Heading>
      );
    },
    Footer() {
      const { toForgotPassword } = useAuthenticator();
      const { tokens } = useTheme();
      return (
        <View textAlign="center" padding={tokens.space.large}>
          <Button
            fontWeight="normal"
            onClick={toForgotPassword}
            size="small"
            variation="link"
          >
            Forgot Password?
          </Button>
        </View>
      );
    },
  },
};
