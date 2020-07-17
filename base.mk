PWD ?= pwd_unknown
BASE_DIR := $(dir $(lastword $(MAKEFILE_LIST)))

export PROJECT_ROOT_DIR := $(dir $(abspath $(lastword $(MAKEFILE_LIST))))
CONFIG_FILE ?= $(BASE_DIR)/.awsboilerplate.json

define GetFromCfg
$(shell node -p "require('$(CONFIG_FILE)').$(1)")
endef

export ENV_STAGE ?= $(call GetFromCfg,defaultEnv)
export PROJECT_NAME ?= $(call GetFromCfg,projectName)
export AWS_DEFAULT_REGION ?= $(call GetFromCfg,aws.region)

ENV_CONFIG_FILE ?= $(BASE_DIR)/.awsboilerplate.$(ENV_STAGE).json

define GetFromEnvCfg
$(shell node -p "require('$(ENV_CONFIG_FILE)').$(1)")
endef

export HOSTED_ZONE_ID := $(call GetFromEnvCfg,hostedZone.id)
export HOSTED_ZONE_NAME := $(call GetFromEnvCfg,hostedZone.name)

export TOOLS_HOSTED_ZONE_ID := $(call GetFromCfg,toolsConfig.hostedZone.id)
export TOOLS_HOSTED_ZONE_NAME := $(call GetFromCfg,toolsConfig.hostedZone.name)

export VERSION_MATRIX_DOMAIN := $(call GetFromCfg,toolsConfig.domains.versionMatrix)
export ADMIN_PANEL_DOMAIN := $(call GetFromEnvCfg,domains.adminPanel)
export API_DOMAIN := $(call GetFromEnvCfg,domains.api)
export WEB_APP_DOMAIN := $(call GetFromEnvCfg,domains.webApp)
export WWW_DOMAIN := $(call GetFromEnvCfg,domains.www)

ifeq ($(CI),true)
	AWS_VAULT =
	VERSION := $(shell cat $(BASE_DIR)/VERSION)
	DOCKER_COMPOSE = docker-compose -p $(PROJECT_NAME)_$(HOST_UID) -f $(BASE_DIR)/docker-compose.yml -f $(BASE_DIR)/docker-compose.ci.yml
else ifeq ($(ENV_STAGE),local)
	AWS_VAULT =
	VERSION := $(shell git describe --tags --first-parent --abbrev=11 --long --dirty --always)
	DOCKER_COMPOSE = docker-compose -p $(PROJECT_NAME)_$(HOST_UID)
else
	AWS_VAULT_PROFILE := $(call GetFromCfg,aws.profile)
	AWS_VAULT = aws-vault exec $(AWS_VAULT_PROFILE) --
	VERSION := $(shell git describe --tags --first-parent --abbrev=11 --long --dirty --always)
	DOCKER_COMPOSE = docker-compose -p $(PROJECT_NAME)_$(HOST_UID)
endif

export VERSION

ifeq ($(user),)
# USER retrieved from env, UID from shell.
HOST_USER ?= $(strip $(if $(USER),$(USER),nodummy))
HOST_UID ?= $(strip $(if $(shell id -u),$(shell id -u),4000))
else
# allow override by adding user= and/ or uid=  (lowercase!).
# uid= defaults to 0 if user= set (i.e. root).
HOST_USER = $(user)
HOST_UID = $(strip $(if $(uid),$(uid),0))
endif

CMD_ARGUMENTS ?= $(cmd)

export HOST_USER
export HOST_UID



version:
	@echo $(VERSION)

install-infra-cdk:
	$(MAKE) -C $(BASE_DIR)/infra/cdk install

install-infra-functions:
	$(MAKE) -C $(BASE_DIR)/infra/functions install

install-scripts:
	$(MAKE) -C $(BASE_DIR)/scripts install

aws-shell:
	$(AWS_VAULT) $(SHELL)

up:
	$(DOCKER_COMPOSE) up --build --force-recreate

down:
	# run as a (background) service
	docker-compose -p $(PROJECT_NAME)_$(HOST_UID) down

clean:
	# remove created images
	@docker-compose -p $(PROJECT_NAME)_$(HOST_UID) down --remove-orphans --rmi all 2>/dev/null \
	&& echo 'Image(s) for "$(PROJECT_NAME):$(HOST_USER)" removed.' \
	|| echo 'Image(s) for "$(PROJECT_NAME):$(HOST_USER)" already removed.'

prune:
	# clean all that is not actively used
	docker system prune -af

upload-service-version:
	$(AWS_VAULT) node $(BASE_DIR)/scripts/upload-service-version.js $(SERVICE_NAME)
