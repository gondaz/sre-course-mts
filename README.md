1. Ansible плейбук для деплоя кластера PostgreSQL + Patroni with etcd as DCS. Haproxy в качестве LB
2. Helm Chart для деплоя API сервиса в k8s
Требования для управляющего хоста:

Ansible, helm
3 ВМ для PG+Patroni+etcd, 1 ВМ для Haproxy. Публичный ключ пользователя от которого будет запущен деплой должен находиться на управляемых ВМ. Приватный ключ пользователя и Kubeconfig для доступа к k8s должны находиться на управляющей машине. Хостнейм pustovetov.mts.tld необходимо добавить в локальный hosts файл.
Описание необходимых переменных для деплоя PostgreSQL указаны в README внутри директории ansible-postgres-deploy

Гайд для деплоя:

Поднимаем кластер (PG + Patroni + etcd) + (haproxy):
ansible-playbook -i inventory deploy_pgcluster.yml
Создаем БД в созданном кластере и применяем в неё схему (init.sql):
psql -h <haproxy_ip> -U username -p 5000 -c "CREATE DATABASE weather;"
psql -h <haproxy_ip> -U username -d weather -p 5000 -f init.sql"
Деплоим api сервис в k8s:
helm install api api/ --values api/values.yaml
Проверяем что api сервис работает и может подключиться к БД:
curl -v http://pustovetov.mts.tld/Cities
За основу деплоя кластера PostgreSQL взят репозиторий https://github.com/vitabaks/postgresql_cluster
