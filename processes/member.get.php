<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원정보를 가져온다.
 *
 * @file /modules/member/processes/member.get.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2024. 1. 26.
 *
 * @var \modules\member\Member $me
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($me->getAdmin()->checkPermission('members', ['edit']) == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$member_id = Request::get('member_id', true);
$data = $me
    ->db()
    ->select(['member_id', 'email', 'name', 'nickname', 'level_id'])
    ->from($me->table('members'))
    ->where('member_id', $member_id)
    ->getOne();
if ($data === null) {
    $results->success = false;
    $results->message = $me->getErrorText('NOT_FOUND_DATA');
    return;
}

$data->group_ids = [];
$groups = $me->getMember($member_id)->getGroups(true);
foreach ($groups as $group) {
    $data->group_ids[] = $group->getGroupId();
}

/*$me
    ->db()
    ->select(['group_id'])
    ->from($me->table('group_members'))
    ->where('member_id', $member_id)
    ->get('group_id');
    */

$results->success = true;
$results->data = $data;
