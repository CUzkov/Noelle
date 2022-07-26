package utils

import (
	"context"
	"discord-bot/config"
	"discord-bot/logger"

	"github.com/yandex-cloud/go-genproto/yandex/cloud/compute/v1"
	ycsdk "github.com/yandex-cloud/go-sdk"
)

func YandexCloudServerInstanceInfo() (*compute.Instance, error) {
	ctx := context.Background()
	
	sdk, err := ycsdk.Build(ctx, ycsdk.Config{
		Credentials: ycsdk.OAuthToken(config.Config.YandexCloudToken),
	})

	if err != nil {
		logger.ErrorLog.Fatalln(err.Error())
	}

	instance, err := sdk.Compute().Instance().Get(ctx, &compute.GetInstanceRequest{
		InstanceId: config.Config.YandexCloudServerInstaceId,
		View: 0,
	})

	if err != nil {
		return nil, err
	}

	return instance, nil
}
