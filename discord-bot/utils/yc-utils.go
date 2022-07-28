package utils

import (
	"context"
	"discord-bot/config"
	"discord-bot/logger"

	"github.com/yandex-cloud/go-genproto/yandex/cloud/compute/v1"
	ycsdk "github.com/yandex-cloud/go-sdk"
)

func YandexCloudServerInstanceInfo() (*compute.Instance, error) {
	instanceId := config.Config.YandexCloudServerInstaceId
	oAuthToken := config.Config.YandexCloudToken

	ctx := context.Background()
	
	sdk, err := ycsdk.Build(ctx, ycsdk.Config{
		Credentials: ycsdk.OAuthToken(oAuthToken),
	})

	if err != nil {
		logger.ErrorLog.Fatalln(err)
	}

	instance, err := sdk.Compute().Instance().Get(ctx, &compute.GetInstanceRequest{
		InstanceId: instanceId,
		View: 0,
	})

	if err != nil {
		return nil, err
	}

	return instance, nil
}

func StartYandexCloudServerInstance() (error) {
	instanceId := config.Config.YandexCloudServerInstaceId
	oAuthToken := config.Config.YandexCloudToken

	ctx := context.Background()
	
	sdk, err := ycsdk.Build(ctx, ycsdk.Config{
		Credentials: ycsdk.OAuthToken(oAuthToken),
	})

	if err != nil {
		logger.ErrorLog.Println(err)
		return err
	}

	sdk.Compute().Instance().Start(ctx, &compute.StartInstanceRequest{
		InstanceId: instanceId,
	})
	
	return nil
}
