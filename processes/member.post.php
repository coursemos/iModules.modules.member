<?php
/**
 * 이 파일은 아이모듈 관리자모듈의 일부입니다. (https://www.imodules.io)
 *
 * 회원정보를 저장한다.
 *
 * @file /modules/member/processes/member.post.php
 * @author Arzz <arzz@arzz.com>
 * @license MIT License
 * @modified 2023. 7. 17.
 *
 * @var \modules\member\Member $me
 * @var Input $input
 */
if (defined('__IM_PROCESS__') == false) {
    exit();
}

/**
 * @var \modules\member\admin\MemberAdmin $mAdmin
 */
$mAdmin = $me->getAdmin();

/**
 * 관리자권한이 존재하는지 확인한다.
 */
if ($mAdmin->checkPermission('members', 'members') == false) {
    $results->success = false;
    $results->message = $me->getErrorText('FORBIDDEN');
    return;
}

$member_id = Request::get('member_id');
if ($member_id !== null) {
}

$errors = [];
$email =
    Format::checkEmail($input->get('email')) == true
        ? $input->get('email')
        : ($errors['email'] = $me->getErrorText('INVALID_EMAIL'));
if (isset($errors['email']) == false) {
    $check = $me
        ->db()
        ->select()
        ->from($me->table('members'))
        ->where('email', $email);
    if ($member_id !== null) {
        $check->where('member_id', $member_id, '!=');
    }
    if ($check->has() == true) {
        $errors['email'] = $me->getErrorText('DUPLICATED');
    }
}

$name = $input->get('name', $errors);
$nickname =
    Format::checkNickname($input->get('nickname')) == true
        ? $input->get('nickname')
        : ($errors['nickname'] = $me->getErrorText('INVALID_NICKNAME'));
if (isset($errors['nickname']) == false) {
    $check = $me
        ->db()
        ->select()
        ->from($me->table('members'))
        ->where('nickname', $nickname);
    if ($member_id !== null) {
        $check->where('member_id', $member_id, '!=');
    }
    if ($check->has() == true) {
        $errors['nickname'] = $me->getErrorText('DUPLICATED');
    }
}

if ($member_id === null) {
    $password = $input->get('password', $errors);
}

if (count($errors) == 0) {
    $insert = [];
    if ($member_id === null) {
        $insert['email'] = $email;
        $insert['password'] = Password::hash($password);
        $insert['name'] = $name;
        $insert['nickname'] = $nickname;
        $insert['verified'] = 'TRUE';
        $insert['status'] = 'ACTIVATED';
        $insert['joined_at'] = time();

        $result = $me
            ->db()
            ->insert($me->table('members'), $insert)
            ->execute();
        $member_id = $result->insert_id;
    }

    $results->success = true;
    $results->member_id = $member_id;
} else {
    $results->success = false;
    $results->errors = $errors;
}
