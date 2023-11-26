# PostgreSQL High-Availability Cluster :elephant: :sparkling_heart:


## Deployment: quick start
0. [Install Ansible](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html) on one control node (which could easily be a laptop)

```
sudo apt update && sudo apt install -y python3-pip sshpass git
pip3 install ansible
```

1. Download or clone this repository

```
git clone https://github.com/vitabaks/postgresql_cluster.git
```

2. Go to the playbook directory

```
cd postgresql_cluster/
```

3. Edit the inventory file

###### Specify (non-public) IP addresses and connection settings (`ansible_user`, `ansible_ssh_pass` or `ansible_ssh_private_key_file` for your environment

```
nano inventory
```

4. Edit the variable file vars/[main.yml](./vars/main.yml)

```
nano vars/main.yml
```

###### Minimum set of variables: 
- `proxy_env` # if required (*for download packages*)
- `cluster_vip` # for client access to databases in the cluster (optional)
- `patroni_cluster_name`
- `postgresql_version`
- `postgresql_data_dir`
- `with_haproxy_load_balancing` `'true'` (Type A) or `'false'`/default (Type B)
- `dcs_type` # "etcd" (default) or "consul" (Type C)

if dcs_type: "consul", please install consul role requirements on the control node:

```
ansible-galaxy install -r roles/consul/requirements.yml
```

5. Try to connect to hosts

```
ansible all -m ping
```

6. Run playbook:

```
ansible-playbook deploy_pgcluster.yml
```

## Variables
See the vars/[main.yml](./vars/main.yml), [system.yml](./vars/system.yml) and ([Debian.yml](./vars/Debian.yml) or [RedHat.yml](./vars/RedHat.yml)) files for more details.


### Update the PostgreSQL HA Cluster

Use the `update_pgcluster.yml` playbook for update the PostgreSQL HA Cluster to a new minor version (for example 15.1->15.2, and etc).

<details><summary>Update PostgreSQL</summary>

```
ansible-playbook update_pgcluster.yml -e target=postgres
```

</details>


<details><summary>Update Patroni</summary>

```
ansible-playbook update_pgcluster.yml -e target=patroni
```

</details>

<details><summary>Update all system</summary>

includes PostgreSQL and Patroni

```
ansible-playbook update_pgcluster.yml -e target=system
```

</details>

More details [here](roles/update/README.md)

### PostgreSQL major upgrade

Use the `pg_upgrade.yml` playbook to upgrade the PostgreSQL to a new major version (for example 14->15, and etc).

<details><summary>Upgrade PostgreSQL</summary>

```
ansible-playbook pg_upgrade.yml -e "pg_old_version=14 pg_new_version=15"
```

</details>

More details [here](roles/upgrade/README.md)

## License
Licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## Author
Vitaliy Kukharik (PostgreSQL DBA) \
vitabaks@gmail.com
